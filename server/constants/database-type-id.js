// Constants for common type ids utilised in the database

export const CLIENT_USER_TYPE_ID = {
    Admin: 1,
    User: 2
}

export const STATION_USER_TYPE_ID = {
    Owner: 1,
    Admin: 2,
    Viewer: 3
};

export const NOTIFICATION_EVENT_TYPE_ID = {
    NewDetection: 1,
    DailySummary: 2,
    LowStorage: 3
};

export const NOTIFICATION_CHANNEL_TYPE_ID = {
    Toast: 1,
    Email: 2,
    Push: 3
};
