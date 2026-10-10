pub mod config;
pub mod games_hostlist;
pub mod parser;
pub mod runner;

#[cfg(test)]
#[path = "config_tests.rs"]
mod config_tests;

#[cfg(test)]
#[path = "parser_tests.rs"]
mod parser_tests;

#[cfg(test)]
#[path = "games_hostlist_tests.rs"]
mod games_hostlist_tests;

#[cfg(test)]
#[path = "runner_tests.rs"]
mod runner_tests;
