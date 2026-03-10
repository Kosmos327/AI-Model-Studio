use std::sync::Mutex;
use tauri::{Manager, RunEvent};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandChild;

/// Holds the backend child process so it can be killed on exit.
struct BackendProcess(Mutex<Option<CommandChild>>);

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(BackendProcess(Mutex::new(None)))
        .setup(|app| {
            // Resolve per-user app data directory for database and storage.
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to resolve app data directory");

            std::fs::create_dir_all(&app_data_dir)
                .expect("Failed to create app data directory");

            let storage_dir = app_data_dir.join("storage");
            let db_path = app_data_dir.join("studio.db");

            std::fs::create_dir_all(&storage_dir)
                .expect("Failed to create storage directory");

            // Build a portable SQLite URL (forward slashes work on all platforms).
            let db_url = format!(
                "sqlite:///{}",
                db_path.to_string_lossy().replace('\\', '/')
            );

            // Spawn the backend sidecar with the correct data paths.
            let (rx, child) = app
                .shell()
                .sidecar("backend")
                .expect("backend sidecar not found – run `npm run build:backend` first")
                .env("DATABASE_URL", &db_url)
                .env("STORAGE_DIR", storage_dir.to_string_lossy().as_ref())
                .env("CORS_ORIGINS", "*")
                .spawn()
                .expect("Failed to spawn backend process");

            // Drain backend stdout/stderr in an async task so the OS pipe buffers
            // never fill up and block the backend process.
            tauri::async_runtime::spawn(async move {
                let mut rx = rx;
                while rx.recv().await.is_some() {}
            });

            *app.state::<BackendProcess>().0.lock().unwrap() = Some(child);

            // Wait for FastAPI in a background thread so the Tauri setup
            // (and therefore the window) is not blocked.
            std::thread::spawn(|| {
                wait_for_backend();
            });

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            // Kill the backend when the last window is destroyed or the app exits.
            if let RunEvent::ExitRequested { .. } = event {
                let state = app_handle.state::<BackendProcess>();
                if let Ok(mut guard) = state.0.lock() {
                    if let Some(mut child) = guard.take() {
                        let _ = child.kill();
                    }
                }
            }
        });
}

/// Poll port 8000 until the backend is ready or the timeout elapses.
fn wait_for_backend() {
    use std::net::{TcpStream, ToSocketAddrs};
    use std::time::Duration;
    use std::thread;

    const BACKEND_STARTUP_TIMEOUT_SECS: u32 = 30;

    let addr = "127.0.0.1:8000"
        .to_socket_addrs()
        .unwrap()
        .next()
        .unwrap();

    for _ in 0..BACKEND_STARTUP_TIMEOUT_SECS {
        if TcpStream::connect_timeout(&addr, Duration::from_secs(1)).is_ok() {
            return;
        }
        thread::sleep(Duration::from_secs(1));
    }

    eprintln!("Warning: backend did not become ready within {BACKEND_STARTUP_TIMEOUT_SECS} seconds");
}
