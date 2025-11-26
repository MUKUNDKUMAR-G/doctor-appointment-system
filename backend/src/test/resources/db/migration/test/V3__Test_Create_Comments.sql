-- Test migration V3: Create comments table
CREATE TABLE test_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES test_posts(id),
    FOREIGN KEY (user_id) REFERENCES test_users(id)
);

CREATE INDEX idx_comments_post ON test_comments(post_id);
CREATE INDEX idx_comments_user ON test_comments(user_id);
