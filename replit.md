Discord Boss Timer Bot
Overview
A Discord bot built with Node.js and discord.js that manages boss respawn timers for games. Features persistent storage, 15-minute advance warnings, and keep-alive functionality for 24/7 operation.

Current State
Status: Production Ready
Last Updated: November 5, 2025
Stack: Node.js (ES Modules) with discord.js, Express, dotenv
Storage: JSON file-based persistence
Recent Changes
November 5, 2025: Complete rewrite to persistent storage version
Added timers.json file-based storage for timer persistence
Implemented Express keep-alive server on port 3000
Added 15-minute advance warning system
Changed to flexible time format (+8h30m syntax)
Added map location tracking for bosses
Limited commands to "resp-boss" channel only
Switched to ES modules (type: module in package.json)
Auto-cleanup of timers after respawn
Project Architecture
File Structure
.
├── index.js           # Main bot file with all commands and keep-alive server
├── package.json       # Node.js dependencies with ES module support
├── timers.json        # Persistent timer storage (auto-generated)
├── README.md          # User setup instructions
├── replit.md          # Project documentation
└── .gitignore        # Git ignore configuration

Key Components
Discord Client: Handles bot connection and events using ES modules
Express Keep-Alive Server: HTTP server on port 3000 for UptimeRobot pinging
Command Handler: Processes message commands in "resp-boss" channel only
Timer Storage:
In-memory Map structure for runtime
JSON file persistence for restarts
Timer Scheduler:
Schedules 15-minute warnings
Auto-cleanup after respawn
File I/O: Loads/saves timers to timers.json
Commands Implementation
!boss <name> <map> +<time>: Adds boss with flexible time format (+8h, +45m, +2h30m)
!timery: Lists all active timers with respawn times
!bossdel <name> <map>: Deletes timer by boss+map combination
!timerclean: Removes all timers
Timer Features
Persistent Storage: Timers saved to timers.json file
15-Minute Warnings: Automatic notification 15 minutes before respawn
Auto-Cleanup: Timers automatically removed after respawn time
Flexible Time Format: Supports +8h, +45m, or +2h30m formats
Map Tracking: Each boss can have different timers per map location
Channel Configuration
Bot only responds in channel named "resp-boss"
Prevents spam in other channels
Required Secrets
DISCORD_BOT_TOKEN: Discord bot authentication token
User Preferences
None specified yet.

Dependencies
Node.js 20 (ES Modules)
discord.js: Discord API library
express: Keep-alive HTTP server
dotenv: Environment variable management
fs: File system (built-in Node.js)
Future Enhancements
Add web dashboard for timer management
Support custom channel names via configuration
Add role-based permissions for command usage
Implement boss categories or grouping
Add timezone support for multi-region servers
Create recurring boss timers
Add webhook notifications to multiple channels
