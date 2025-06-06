
<?php
// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Parse request URL
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove everything before /api/
$apiPos = strpos($uri, '/api/');
if ($apiPos !== false) {
    $uri = substr($uri, $apiPos + strlen('/api/'));
}

$uri_parts = explode('/', trim($uri, '/'));

$controller = isset($uri_parts[0]) ? $uri_parts[0] : '';
$action = isset($uri_parts[1]) ? $uri_parts[1] : '';
$id = isset($uri_parts[2]) ? $uri_parts[2] : null;

// Get Authorization header via getallheaders() if available
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        // Convert all headers to uppercase for case-insensitive matching
        $headers = array_change_key_case($headers, CASE_UPPER);
        
        if (isset($headers['AUTHORIZATION'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['AUTHORIZATION'];
        }
    }
}

// Include the appropriate controller based on the request
switch ($controller) {
    case 'auth':
        require __DIR__ . '/../controllers/auth_controller.php';
        $auth_controller = new AuthController();
        
        switch ($action) {
            case 'login':
                $auth_controller->login();
                break;
            case 'register':
                $auth_controller->register();
                break;
            case 'logout':
                $auth_controller->logout();
                break;
            case 'refresh':
                $auth_controller->refresh();
                break;
            default:
                http_response_code(404);
                echo json_encode(['message' => 'Not Found']);
                break;
        }
        break;
        
    case 'todos':
        require __DIR__ . '/../controllers/todo_controller.php';
        $todo_controller = new TodoController();
        
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && !$id) {
            $todo_controller->getAll();
        } else if ($_SERVER['REQUEST_METHOD'] === 'GET' && $id) {
            $todo_controller->getById($id);
        } else if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$id) {
            $todo_controller->create();
        } else if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $action === 'toggle') {
            $todo_controller->toggle($id);
        } else if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $id) {
            $todo_controller->update($id);
        } else if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id) {
            $todo_controller->delete($id);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Not Found']);
        }
        break;
        
    case 'lists':
        require __DIR__ . '/../controllers/list_controller.php';
        $list_controller = new ListController();
        
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && !$id) {
            $list_controller->getAll();
        } else if ($_SERVER['REQUEST_METHOD'] === 'GET' && $id) {
            $list_controller->getById($id);
        } else if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$id) {
            $list_controller->create();
        } else if ($_SERVER['REQUEST_METHOD'] === 'PUT' && $id) {
            $list_controller->update($id);
        } else if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id) {
            $list_controller->delete($id);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Not Found']);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['message' => 'API Endpoint Not Found']);
        break;
}
