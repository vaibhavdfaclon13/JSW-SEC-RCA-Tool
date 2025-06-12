# Server-Side Storage Implementation

This application now uses server-side storage for user data instead of browser cookies.

## What's Stored

- **User ID**: The user's identifier 
- **Selected Insight ID**: The last selected insight ID for each user
- **Last Used**: Timestamp of when the user data was last updated

## How It Works

### API Endpoints

- `GET /api/user?userId={userId}` - Retrieve user data
- `POST /api/user` - Store/update user data 
- `DELETE /api/user?userId={userId}` - Remove user data

### Storage Location

User data is stored in: `./data/users.json`

### Data Structure

```json
{
  "user123": {
    "userId": "user123",
    "selectedInsightId": "insight456",
    "lastUsed": "2024-01-01T12:00:00.000Z"
  }
}
```

## Benefits

1. **Persistence**: Data survives browser refreshes and different sessions
2. **Cross-device**: Users can access their settings from different browsers/devices
3. **Server-side**: No reliance on browser storage (cookies/localStorage)
4. **Default Selection**: Users land on their previously selected insight automatically

## User Experience

1. When a user enters their User ID, the system checks server storage
2. If they have a previously selected insight, it's automatically selected
3. Any insight selection is immediately saved to the server
4. On refresh, the user stays on their last selected insight

## Notes

- The `data/` directory is gitignored to prevent accidental commits of user data
- A minimal localStorage is used temporarily for session continuity only
- All persistent storage happens on the server side 