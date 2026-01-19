//! Error types for the BioSky ingester

use thiserror::Error;

#[derive(Error, Debug)]
#[allow(dead_code)]
pub enum IngesterError {
    #[error("WebSocket error: {0}")]
    WebSocket(#[from] tokio_tungstenite::tungstenite::Error),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("CBOR decode error: {0}")]
    CborDecode(String),

    #[error("Invalid frame: {0}")]
    InvalidFrame(String),

    #[error("Connection closed")]
    ConnectionClosed,

    #[error("Max reconnection attempts reached")]
    MaxReconnectAttempts,

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Parse error: {0}")]
    Parse(String),
}

impl From<ciborium::de::Error<std::io::Error>> for IngesterError {
    fn from(err: ciborium::de::Error<std::io::Error>) -> Self {
        IngesterError::CborDecode(err.to_string())
    }
}

pub type Result<T> = std::result::Result<T, IngesterError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cbor_decode_error_display() {
        let err = IngesterError::CborDecode("invalid format".to_string());
        assert_eq!(format!("{}", err), "CBOR decode error: invalid format");
    }

    #[test]
    fn test_invalid_frame_error_display() {
        let err = IngesterError::InvalidFrame("missing header".to_string());
        assert_eq!(format!("{}", err), "Invalid frame: missing header");
    }

    #[test]
    fn test_connection_closed_error_display() {
        let err = IngesterError::ConnectionClosed;
        assert_eq!(format!("{}", err), "Connection closed");
    }

    #[test]
    fn test_max_reconnect_attempts_error_display() {
        let err = IngesterError::MaxReconnectAttempts;
        assert_eq!(format!("{}", err), "Max reconnection attempts reached");
    }

    #[test]
    fn test_config_error_display() {
        let err = IngesterError::Config("missing DATABASE_URL".to_string());
        assert_eq!(format!("{}", err), "Configuration error: missing DATABASE_URL");
    }

    #[test]
    fn test_parse_error_display() {
        let err = IngesterError::Parse("invalid integer".to_string());
        assert_eq!(format!("{}", err), "Parse error: invalid integer");
    }

    #[test]
    fn test_error_is_debug() {
        let err = IngesterError::ConnectionClosed;
        let debug_str = format!("{:?}", err);
        assert!(debug_str.contains("ConnectionClosed"));
    }
}
