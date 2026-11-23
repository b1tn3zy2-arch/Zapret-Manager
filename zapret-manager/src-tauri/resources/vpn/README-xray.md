# Xray-core bundle

- Version: v26.10.21
- Source: https://github.com/XTLS/Xray-core/releases/tag/v26.10.21
- Upstream asset: `Xray-windows-64.zip`
- Upstream asset SHA-256: `fc58c39ee2f2717b4c54d28d374362389e5319b20ae44aea76ea45a5243ec827`
- Repacked archive: only `xray.exe`, `geoip.dat`, upstream `LICENSE` and `README.md`
- Repacked archive SHA-256: `d96ee1ed32b61f69136a4ee8019593f7144857f4dc8c41069dd5faefb76ea751`
- `xray.exe` SHA-256: `c77a00eb84fb93ae044c2d771a1cabcc033b81e487253fbc35b12df6879c1e15`
- `geoip.dat` SHA-256: `cbea6088e0ba9acee4b02f89365338e5f499eb51061e1a0700647da02e91b917`

`wintun.dll`, `geosite.dat` and the helper scripts from the upstream archive are not
redistributed: the application only uses Xray's SOCKS/HTTP inbound and the
`geoip:private` routing rule.
