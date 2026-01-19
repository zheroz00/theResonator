import logging
import sqlite3
from contextlib import contextmanager
from pathlib import Path

from app.config import get_settings

settings = get_settings()
DB_PATH = Path(settings.OUTPUT_DIR) / "resonator.db"
logger = logging.getLogger(__name__)


def init_db():
    """Initialize database with WAL mode and create tables if they don't exist."""
    # Ensure output directory exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    with get_db() as conn:
        # Enable WAL mode for better durability
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute("PRAGMA busy_timeout=5000")

        conn.executescript("""
            CREATE TABLE IF NOT EXISTS songs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt TEXT NOT NULL,
                duration INTEGER NOT NULL,
                filename TEXT NOT NULL UNIQUE,
                processed_filename TEXT,
                custom_name TEXT,
                is_favorite INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_songs_is_favorite ON songs(is_favorite);
        """)

    logger.info(f"Database initialized at {DB_PATH}")


def checkpoint_db():
    """Force WAL checkpoint to ensure all changes are written to main database file."""
    try:
        with get_db() as conn:
            conn.execute("PRAGMA wal_checkpoint(TRUNCATE)")
        logger.info("Database checkpoint completed")
    except Exception as e:
        logger.error(f"Database checkpoint failed: {e}")


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        conn.close()
