use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::winapi_helpers::OwnedProcessHandle;

pub struct RunningProcess {
    pub pid: u32,
    pub log_path: PathBuf,
    pub started_at: u64,
    pub handle: OwnedProcessHandle,
}

pub struct ProcessManager {
    processes: Mutex<HashMap<String, RunningProcess>>,
}

impl ProcessManager {
    pub fn new() -> Self {
        Self {
            processes: Mutex::new(HashMap::new()),
        }
    }

    pub fn contains(&self, id: &str) -> bool {
        match self.processes.lock() {
            Ok(map) => map.contains_key(id),
            Err(poisoned) => poisoned.into_inner().contains_key(id),
        }
    }

    pub fn ids(&self) -> Vec<String> {
        match self.processes.lock() {
            Ok(map) => map.keys().cloned().collect(),
            Err(poisoned) => poisoned.into_inner().keys().cloned().collect(),
        }
    }

    pub fn insert(&self, id: String, process: RunningProcess) {
        match self.processes.lock() {
            Ok(mut map) => {
                map.insert(id, process);
            }
            Err(poisoned) => {
                poisoned.into_inner().insert(id, process);
            }
        }
    }

    pub fn remove(&self, id: &str) -> Option<RunningProcess> {
        match self.processes.lock() {
            Ok(mut map) => map.remove(id),
            Err(poisoned) => poisoned.into_inner().remove(id),
        }
    }

    pub fn terminate(&self, id: &str) -> bool {
        let process = self.remove(id);

        match process {
            Some(entry) => {
                let killed = entry.handle.terminate(1);
                drop(entry);
                killed
            }
            None => false,
        }
    }

    pub fn clear(&self) -> usize {
        let entries = match self.processes.lock() {
            Ok(mut map) => map.drain().map(|(_, value)| value).collect::<Vec<_>>(),
            Err(poisoned) => poisoned
                .into_inner()
                .drain()
                .map(|(_, value)| value)
                .collect::<Vec<_>>(),
        };

        entries.len()
    }
}

impl Default for ProcessManager {
    fn default() -> Self {
        Self::new()
    }
}

impl Drop for ProcessManager {
    fn drop(&mut self) {
        self.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn manager() -> ProcessManager {
        ProcessManager::new()
    }

    #[test]
    fn test_insert_and_contains() {
        let manager = manager();
        let process = RunningProcess {
            pid: 1,
            log_path: PathBuf::from("a.log"),
            started_at: 0,
            handle: OwnedProcessHandle::from_raw(0),
        };

        manager.insert("id-1".to_string(), process);

        assert!(manager.contains("id-1"));
        assert!(!manager.contains("id-2"));
        assert_eq!(manager.ids(), vec!["id-1".to_string()]);
    }

    #[test]
    fn test_remove_returns_entry() {
        let manager = manager();
        manager.insert(
            "id-1".to_string(),
            RunningProcess {
                pid: 7,
                log_path: PathBuf::from("a.log"),
                started_at: 10,
                handle: OwnedProcessHandle::from_raw(0),
            },
        );

        let removed = manager.remove("id-1").expect("запись должна существовать");

        assert_eq!(removed.pid, 7);
        assert!(!manager.contains("id-1"));
        assert!(manager.remove("id-1").is_none());
    }

    #[test]
    fn test_terminate_unknown_id_returns_false() {
        assert!(!manager().terminate("нет-такого"));
    }

    #[test]
    fn test_clear_drains_everything() {
        let manager = manager();

        for index in 0..3 {
            manager.insert(
                format!("id-{index}"),
                RunningProcess {
                    pid: index,
                    log_path: PathBuf::from("a.log"),
                    started_at: 0,
                    handle: OwnedProcessHandle::from_raw(0),
                },
            );
        }

        assert_eq!(manager.clear(), 3);
        assert!(manager.ids().is_empty());
    }
}