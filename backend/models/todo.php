
<?php
require_once __DIR__ . '/../config/database.php';

class Todo {
    private $conn;
    
    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
        
        // Create todos table if not exists
        $this->createTable();
    }
    
    private function createTable() {
        try {
            $sql = "CREATE TABLE IF NOT EXISTS todos (
                id VARCHAR(36) PRIMARY KEY,
                text TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                list_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                priority VARCHAR(10) NULL,
                due_date TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )";
            
            $this->conn->exec($sql);
            
            // Check if priority column exists, add if not
            $this->ensureColumnExists('priority', 'VARCHAR(10) NULL');
            
            // Check if due_date column exists, add if not
            $this->ensureColumnExists('due_date', 'TIMESTAMP NULL');
            
        } catch (PDOException $e) {
            // If there's an error with the foreign key, try creating the table without it
            error_log("Error creating todos table with foreign key: " . $e->getMessage());
            
            $sql = "CREATE TABLE IF NOT EXISTS todos (
                id VARCHAR(36) PRIMARY KEY,
                text TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                list_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                priority VARCHAR(10) NULL,
                due_date TIMESTAMP NULL
            )";
            
            $this->conn->exec($sql);
        }
    }
    
    // Helper method to add columns if they don't exist
    private function ensureColumnExists($columnName, $columnDefinition) {
        try {
            // Check if column exists
            $checkSql = "SHOW COLUMNS FROM todos LIKE '$columnName'";
            $stmt = $this->conn->query($checkSql);
            
            if ($stmt->rowCount() === 0) {
                // Column does not exist, add it
                $alterSql = "ALTER TABLE todos ADD COLUMN $columnName $columnDefinition";
                $this->conn->exec($alterSql);
                error_log("Added column $columnName to todos table");
            }
        } catch (PDOException $e) {
            error_log("Error checking/adding column $columnName: " . $e->getMessage());
        }
    }
    
    public function findById($id) {
        $sql = "SELECT * FROM todos WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findByUser($user_id) {
        $sql = "SELECT * FROM todos WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function findByUserAndList($user_id, $list_id) {
        $sql = "SELECT * FROM todos WHERE user_id = :user_id AND list_id = :list_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':list_id', $list_id);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $id = uniqid();
        
        $sql = "INSERT INTO todos (id, text, completed, list_id, user_id) 
                VALUES (:id, :text, :completed, :list_id, :user_id)";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':text', $data['text']);
        $stmt->bindParam(':completed', $data['completed'], PDO::PARAM_BOOL);
        $stmt->bindParam(':list_id', $data['list_id']);
        $stmt->bindParam(':user_id', $data['user_id']);
        
        if ($stmt->execute()) {
            return $id;
        }
        
        return false;
    }
    
    public function update($id, $data) {
        $sql = "UPDATE todos SET ";
        $params = [];
        
        foreach ($data as $key => $value) {
            $sql .= "$key = :$key, ";
            $params[":$key"] = $value;
        }
        
        $sql = rtrim($sql, ", ");
        $sql .= " WHERE id = :id";
        $params[':id'] = $id;
        
        $stmt = $this->conn->prepare($sql);
        
        return $stmt->execute($params);
    }
    
    public function delete($id) {
        $sql = "DELETE FROM todos WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        
        return $stmt->execute();
    }
}
