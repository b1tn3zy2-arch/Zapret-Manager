# Встроенные ресурсы zapret

Папка `resources/zapret/` содержит всё, что нужно для запуска стратегий
обхода блокировок. Файлы копируются в `%APPDATA%\com.zapretmanager.app\strategies\`
при первом запуске приложения.

## Версия

1.10.3 — значение `LOCAL_VERSION` из `service.bat`.

## Источники

| Что | Откуда |
|---|---|
| Логика обхода, скрипты, шаблоны | [bol-van/zapret](https://github.com/bol-van/zapret), MIT |
| Готовая сборка под Windows | [Flowseal/zapret-discord-youtube](https://github.com/Flowseal/zapret-discord-youtube) |

## Состав

```
bin/        winws.exe, WinDivert.dll, WinDivert64.sys, cygwin1.dll,
            stun.bin, stun2.bin, ACTIVE_*.bin,
            quic_initial_*.bin, tls_clienthello_*.bin
lists/      list-general.txt, list-google.txt, list-exclude.txt,
            ipset-exclude.txt, ipset-all.txt
utils/      targets.txt
outlast/    default-domains.txt — домены для инъекции Outlast Trials
*.bat       22 стратегии general-* и служебный service.bat
```

## Переименование стратегий

Оригинальные имена содержат пробелы и скобки (`general (ALT2).bat`), из-за
которых ломается сортировка в списках и экранирование в cmd. Стратегии
переименованы по возрастанию сложности:

```
general.bat                       → general-00-baseline.bat
general (ALT).bat                 → general-01-alt.bat
…
general (FAKE TLS AUTO ALT3).bat  → general-21-faketls-auto-alt3.bat
```

`service.bat` оставлен без изменений: каждый `general-*.bat` вызывает его
через `call service.bat`, и переименование сломало бы вызов. Содержимое всех
`.bat` — рабочие копии оригинала.

## Раскладка обязана оставаться плоской

Каждый скрипт начинается с

```bat
cd /d "%~dp0"
set "BIN=%~dp0bin\"
set "LISTS=%~dp0lists\"
```

Значит `service.bat`, `bin/` и `lists/` обязаны лежать в той же папке, что и
стратегии. Вынос их на уровень выше сделает стратегии неработоспособными.

## ipset-all.txt

В сборке лежит заглушка на 18 байт (`203.0.113.113/32`) — она убивает инъекцию
по спискам IP. Здесь восстановлен полный список из `ipset-all.txt.backup`
архива, 556 КБ.

## Проверка обновлений zapret

`utils/check_updates.enabled` в бандл намеренно **не включён**. Штатный
апдейт zapret отключён: приложение само управляет версией ресурсов через
`manifest.json` и обновляет их при обновлении приложения. При запуске стратегии
в окружение добавляется `NO_UPDATE_CHECK=1`.

## Как обновить

1. Заменить файлы в `resources/zapret/`.
2. Обновить `LOCAL_VERSION` в `service.bat`, если версия изменилась.
3. Выполнить `node scripts/generate-manifest.js` — пересчитаются SHA-256.
4. Собрать приложение.

При следующем запуске приложение увидит новую версию в `manifest.json`,
создаст бэкап в `backups/update-{timestamp}/`, добавит новые стратегии и
обновит бинарники, не трогая ваши правки.