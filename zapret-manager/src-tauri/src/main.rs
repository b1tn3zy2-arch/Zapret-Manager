// Выполняем операцию: #![cfg_attr(not(debug_assertions), windows_subsystem = .
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Объявляем функцию main.
fn main() {
    // Выполняем операцию: zapret_manager_lib::run().
    zapret_manager_lib::run()
    // Закрываем блок.
}
