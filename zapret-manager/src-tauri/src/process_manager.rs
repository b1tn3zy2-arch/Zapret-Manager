// Подключаем модули: std::collections::HashMap;.
use std::collections::HashMap;
// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;
// Подключаем модули: std::sync::Mutex;.
use std::sync::Mutex;

// Подключаем модули: crate::winapi_helpers::OwnedProcessHandle;.
use crate::winapi_helpers::OwnedProcessHandle;

// Объявляем структуру RunningProcess.
pub struct RunningProcess {
    // Выполняем операцию: pub pid: u32,.
    pub pid: u32,
    // Выполняем операцию: pub log_path: PathBuf,.
    pub log_path: PathBuf,
    // Выполняем операцию: pub started_at: u64,.
    pub started_at: u64,
    // Выполняем операцию: pub handle: OwnedProcessHandle,.
    pub handle: OwnedProcessHandle,
    // Закрываем блок.
}

// Объявляем структуру ProcessManager.
pub struct ProcessManager {
    // Выполняем операцию: processes: Mutex<HashMap<String, RunningProcess>>,.
    processes: Mutex<HashMap<String, RunningProcess>>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl ProcessManager {
    // Объявляем функцию new.
    pub fn new() -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: processes: Mutex::new(HashMap::new()),.
            processes: Mutex::new(HashMap::new()),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию contains.
    pub fn contains(&self, id: &str) -> bool {
        // Выбираем вариант по значению.
        match self.processes.lock() {
            // Выполняем операцию: Ok(map) => map.contains_key(id),.
            Ok(map) => map.contains_key(id),
            // Выполняем операцию: Err(poisoned) => poisoned.into_inner().contains_key(id).
            Err(poisoned) => poisoned.into_inner().contains_key(id),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию ids.
    pub fn ids(&self) -> Vec<String> {
        // Выбираем вариант по значению.
        match self.processes.lock() {
            // Выполняем операцию: Ok(map) => map.keys().cloned().collect(),.
            Ok(map) => map.keys().cloned().collect(),
            // Выполняем операцию: Err(poisoned) => poisoned.into_inner().keys().cloned()..
            Err(poisoned) => poisoned.into_inner().keys().cloned().collect(),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию insert.
    pub fn insert(&self, id: String, process: RunningProcess) {
        // Выбираем вариант по значению.
        match self.processes.lock() {
            // Выполняем операцию: Ok(mut map) => {.
            Ok(mut map) => {
                // Выполняем операцию: map.insert(id, process);.
                map.insert(id, process);
                // Закрываем блок.
            }
            // Выполняем операцию: Err(poisoned) => {.
            Err(poisoned) => {
                // Выполняем операцию: poisoned.into_inner().insert(id, process);.
                poisoned.into_inner().insert(id, process);
                // Закрываем блок.
            } // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию remove.
    pub fn remove(&self, id: &str) -> Option<RunningProcess> {
        // Выбираем вариант по значению.
        match self.processes.lock() {
            // Выполняем операцию: Ok(mut map) => map.remove(id),.
            Ok(mut map) => map.remove(id),
            // Выполняем операцию: Err(poisoned) => poisoned.into_inner().remove(id),.
            Err(poisoned) => poisoned.into_inner().remove(id),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    /// Убирает стратегию из реестра и завершает её процесс.
    /// Возвращает pid, если стратегия была запущена: по нему
    /// добиваются потомков процесса (в legacy-режиме winws.exe живёт
    /// внуком cmd.exe и сам не завершается).
    // Объявляем функцию terminate.
    pub fn terminate(&self, id: &str) -> Option<u32> {
        // Объявляем переменную entry .
        let entry = self.remove(id)?;

        // Объявляем переменную pid .
        let pid = entry.pid;
        // Объявляем переменную _ .
        let _ = entry.handle.terminate(1);

        // Выполняем операцию: Some(pid).
        Some(pid)
        // Закрываем блок.
    }

    // Объявляем функцию clear.
    pub fn clear(&self) -> usize {
        // Объявляем переменную entries .
        let entries = match self.processes.lock() {
            // Выполняем операцию: Ok(mut map) => map.drain().map(|(_, value)| value).coll.
            Ok(mut map) => map.drain().map(|(_, value)| value).collect::<Vec<_>>(),
            // Выполняем операцию: Err(poisoned) => poisoned.
            Err(poisoned) => poisoned
                // Выполняем операцию: .into_inner().
                .into_inner()
                // Выполняем операцию: .drain().
                .drain()
                // Выполняем операцию: .map(|(_, value)| value).
                .map(|(_, value)| value)
                // Выполняем операцию: .collect::<Vec<_>>(),.
                .collect::<Vec<_>>(),
            // Закрываем блок.
        };

        // Выполняем операцию: entries.len().
        entries.len()
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Default for ProcessManager {
    // Объявляем функцию default.
    fn default() -> Self {
        // Выполняем операцию: Self::new().
        Self::new()
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Drop for ProcessManager {
    // Объявляем функцию drop.
    fn drop(&mut self) {
        // Выполняем операцию: self.clear();.
        self.clear();
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Объявляем функцию manager.
    fn manager() -> ProcessManager {
        // Выполняем операцию: ProcessManager::new().
        ProcessManager::new()
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_insert_and_contains.
    fn test_insert_and_contains() {
        // Объявляем переменную manager .
        let manager = manager();
        // Объявляем переменную process .
        let process = RunningProcess {
            // Выполняем операцию: pid: 1,.
            pid: 1,
            // Выполняем операцию: log_path: PathBuf::from("a.log"),.
            log_path: PathBuf::from("a.log"),
            // Выполняем операцию: started_at: 0,.
            started_at: 0,
            // Выполняем операцию: handle: OwnedProcessHandle::from_raw(0),.
            handle: OwnedProcessHandle::from_raw(0),
            // Закрываем блок.
        };

        // Выполняем операцию: manager.insert("id-1".to_string(), process);.
        manager.insert("id-1".to_string(), process);

        // Выполняем операцию: assert!(manager.contains("id-1"));.
        assert!(manager.contains("id-1"));
        // Выполняем операцию: assert!(!manager.contains("id-2"));.
        assert!(!manager.contains("id-2"));
        // Выполняем операцию: assert_eq!(manager.ids(), vec!["id-1".to_string()]);.
        assert_eq!(manager.ids(), vec!["id-1".to_string()]);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_remove_returns_entry.
    fn test_remove_returns_entry() {
        // Объявляем переменную manager .
        let manager = manager();
        // Выполняем операцию: manager.insert(.
        manager.insert(
            // Выполняем операцию: "id-1".to_string(),.
            "id-1".to_string(),
            // Выполняем операцию: RunningProcess {.
            RunningProcess {
                // Выполняем операцию: pid: 7,.
                pid: 7,
                // Выполняем операцию: log_path: PathBuf::from("a.log"),.
                log_path: PathBuf::from("a.log"),
                // Выполняем операцию: started_at: 10,.
                started_at: 10,
                // Выполняем операцию: handle: OwnedProcessHandle::from_raw(0),.
                handle: OwnedProcessHandle::from_raw(0),
                // Закрываем блок.
            },
            // Закрываем выражение или коллекцию.
        );

        // Объявляем переменную removed .
        let removed = manager.remove("id-1").expect("запись должна существовать");

        // Выполняем операцию: assert_eq!(removed.pid, 7);.
        assert_eq!(removed.pid, 7);
        // Выполняем операцию: assert!(!manager.contains("id-1"));.
        assert!(!manager.contains("id-1"));
        // Выполняем операцию: assert!(manager.remove("id-1").is_none());.
        assert!(manager.remove("id-1").is_none());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_terminate_unknown_id_returns_none.
    fn test_terminate_unknown_id_returns_none() {
        // Выполняем операцию: assert!(manager().terminate("нет-такого").is_none());.
        assert!(manager().terminate("нет-такого").is_none());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_clear_drains_everything.
    fn test_clear_drains_everything() {
        // Объявляем переменную manager .
        let manager = manager();

        // Перебираем элементы коллекции.
        for index in 0..3 {
            // Выполняем операцию: manager.insert(.
            manager.insert(
                // Выполняем операцию: format!("id-{index}"),.
                format!("id-{index}"),
                // Выполняем операцию: RunningProcess {.
                RunningProcess {
                    // Выполняем операцию: pid: index,.
                    pid: index,
                    // Выполняем операцию: log_path: PathBuf::from("a.log"),.
                    log_path: PathBuf::from("a.log"),
                    // Выполняем операцию: started_at: 0,.
                    started_at: 0,
                    // Выполняем операцию: handle: OwnedProcessHandle::from_raw(0),.
                    handle: OwnedProcessHandle::from_raw(0),
                    // Закрываем блок.
                },
                // Закрываем выражение или коллекцию.
            );
            // Закрываем блок.
        }

        // Выполняем операцию: assert_eq!(manager.clear(), 3);.
        assert_eq!(manager.clear(), 3);
        // Выполняем операцию: assert!(manager.ids().is_empty());.
        assert!(manager.ids().is_empty());
        // Закрываем блок.
    }
    // Закрываем блок.
}
