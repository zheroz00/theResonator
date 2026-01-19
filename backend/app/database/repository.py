import logging
import os
from typing import Optional

from app.config import get_settings
from app.database.connection import get_db

settings = get_settings()
logger = logging.getLogger(__name__)


class SongRepository:
    """Repository for song CRUD operations."""

    @staticmethod
    def create(prompt: str, duration: int, filename: str) -> dict:
        """Create a new song record."""
        with get_db() as conn:
            cursor = conn.execute(
                "INSERT INTO songs (prompt, duration, filename) VALUES (?, ?, ?)",
                (prompt, duration, filename)
            )
            return SongRepository.get_by_id(cursor.lastrowid)

    @staticmethod
    def get_all(limit: int = 100, offset: int = 0) -> list[dict]:
        """Get all songs, ordered by newest first."""
        with get_db() as conn:
            rows = conn.execute(
                "SELECT * FROM songs ORDER BY created_at DESC LIMIT ? OFFSET ?",
                (limit, offset)
            ).fetchall()
            return [dict(row) for row in rows]

    @staticmethod
    def get_by_id(song_id: int) -> Optional[dict]:
        """Get a song by ID."""
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM songs WHERE id = ?", (song_id,)
            ).fetchone()
            return dict(row) if row else None

    @staticmethod
    def get_by_filename(filename: str) -> Optional[dict]:
        """Get a song by filename."""
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM songs WHERE filename = ?", (filename,)
            ).fetchone()
            return dict(row) if row else None

    @staticmethod
    def update(song_id: int, **kwargs) -> Optional[dict]:
        """Update a song's metadata."""
        valid_fields = {"custom_name", "is_favorite", "processed_filename"}
        updates = {k: v for k, v in kwargs.items() if k in valid_fields and v is not None}

        if not updates:
            return SongRepository.get_by_id(song_id)

        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [song_id]

        with get_db() as conn:
            conn.execute(
                f"UPDATE songs SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                values
            )
            return SongRepository.get_by_id(song_id)

    @staticmethod
    def delete(song_id: int) -> bool:
        """Delete a song by ID."""
        with get_db() as conn:
            cursor = conn.execute("DELETE FROM songs WHERE id = ?", (song_id,))
            return cursor.rowcount > 0

    @staticmethod
    def count() -> int:
        """Get total count of songs."""
        with get_db() as conn:
            row = conn.execute("SELECT COUNT(*) as count FROM songs").fetchone()
            return row["count"]

    @staticmethod
    def validate_and_cleanup() -> dict:
        """Validate songs have existing files, remove orphaned records."""
        with get_db() as conn:
            songs = conn.execute(
                "SELECT id, filename, processed_filename FROM songs"
            ).fetchall()

            orphaned = []
            for song in songs:
                file_path = os.path.join(settings.OUTPUT_DIR, song["filename"])
                if not os.path.exists(file_path):
                    orphaned.append(song["id"])
                    logger.warning(f"Orphaned song record: {song['filename']}")

            if orphaned:
                placeholders = ",".join("?" * len(orphaned))
                conn.execute(
                    f"DELETE FROM songs WHERE id IN ({placeholders})",
                    orphaned
                )
                logger.info(f"Cleaned up {len(orphaned)} orphaned records")

            return {"validated": len(songs), "removed": len(orphaned)}
