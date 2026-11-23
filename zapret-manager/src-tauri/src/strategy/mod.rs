// Выполняем операцию: pub mod config;.
pub mod config;
// Выполняем операцию: pub mod games_hostlist;.
pub mod games_hostlist;
// Выполняем операцию: pub mod parser;.
pub mod parser;
// Выполняем операцию: pub mod runner;.
pub mod runner;

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "config_tests.rs"]
// Выполняем операцию: mod config_tests;.
mod config_tests;

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "parser_tests.rs"]
// Выполняем операцию: mod parser_tests;.
mod parser_tests;

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "games_hostlist_tests.rs"]
// Выполняем операцию: mod games_hostlist_tests;.
mod games_hostlist_tests;

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "runner_tests.rs"]
// Выполняем операцию: mod runner_tests;.
mod runner_tests;
