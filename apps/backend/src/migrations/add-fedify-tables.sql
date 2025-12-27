-- Fedify 관련 테이블 생성 마이그레이션

-- 액터 테이블 (로컬 및 원격 액터)
CREATE TABLE IF NOT EXISTS actors (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255),
  display_name VARCHAR(255),
  bio TEXT,
  inbox_url TEXT,
  shared_inbox_url TEXT,
  url TEXT,
  avatar_url TEXT,
  type VARCHAR(50) DEFAULT 'Person',
  is_local BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 암호화 키 쌍
CREATE TABLE IF NOT EXISTS key_pairs (
  actor_id VARCHAR(255),
  type VARCHAR(50),
  private_key TEXT,
  public_key TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (actor_id, type),
  FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE CASCADE
);

-- 마이크로 포스트 (소셜 피드)
CREATE TABLE IF NOT EXISTS micro_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,
  visibility VARCHAR(50) DEFAULT 'public',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE CASCADE
);

-- 팔로워 관계
CREATE TABLE IF NOT EXISTS follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id VARCHAR(255) NOT NULL,
  following_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES actors(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES actors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (follower_id, following_id)
);

-- ActivityPub 인박스 활동 로그
CREATE TABLE IF NOT EXISTS inbox_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id VARCHAR(255) UNIQUE,
  type VARCHAR(100),
  actor_id VARCHAR(255),
  object_id VARCHAR(255),
  raw_data JSON,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE SET NULL
);

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_actors_username ON actors(username);
CREATE INDEX idx_actors_is_local ON actors(is_local);
CREATE INDEX idx_micro_posts_actor_id ON micro_posts(actor_id);
CREATE INDEX idx_micro_posts_created_at ON micro_posts(created_at DESC);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_inbox_activities_actor_id ON inbox_activities(actor_id);
CREATE INDEX idx_inbox_activities_processed ON inbox_activities(processed);
