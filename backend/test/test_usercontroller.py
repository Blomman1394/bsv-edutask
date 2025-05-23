import pytest
from unittest.mock import Mock
from src.controllers.usercontroller import UserController

"""
Test Design for get_user_by_email method

+---------------+------------------+------------------+---------------------+
| Test Case ID  | Input           | Condition        | Expected Output    |
+---------------+------------------+------------------+---------------------+
| TC1          | valid email,     | Single user      | Return user object |
|              | existing user    | exists           |                    |
+---------------+------------------+------------------+---------------------+
| TC2          | valid email,     | Multiple users   | Return first user  |
|              | multiple users   | exist            |                    |
+---------------+------------------+------------------+---------------------+
| TC3          | valid email,     | Multiple users   | Print warning      |
|              | multiple users   | exist            | message            |
+---------------+------------------+------------------+---------------------+
| TC4          | valid email,     | No user exists   | Return None       |
|              | no user         |                  |                    |
+---------------+------------------+------------------+---------------------+
| TC5          | invalid email    | Invalid format   | Raise ValueError  |
|              |                  |                  |                    |
+---------------+------------------+------------------+---------------------+
| TC6          | valid email      | Database error   | Raise Exception   |
|              |                  |                  |                    |
+---------------+------------------+------------------+---------------------+
"""

@pytest.fixture
def mock_dao():
    return Mock()

@pytest.fixture
def user_controller(mock_dao):
    return UserController(dao=mock_dao)

def test_single_user_returns_user_object(user_controller, mock_dao):
    # Arrange
    test_user = {"email": "test@example.com", "name": "Test User"}
    mock_dao.find.return_value = [test_user]

    # Act
    result = user_controller.get_user_by_email("test@example.com")

    # Assert
    assert result == test_user

def test_multiple_users_returns_first_user(user_controller, mock_dao):
    # Arrange
    test_users = [
        {"email": "test@example.com", "name": "Test User 1"},
        {"email": "test@example.com", "name": "Test User 2"},
    ]
    mock_dao.find.return_value = test_users

    # Act
    result = user_controller.get_user_by_email("test@example.com")

    # Assert
    assert result == test_users[0]

def test_multiple_users_prints_warning(user_controller, mock_dao, capsys):
    # Arrange
    test_users = [
        {"email": "test@example.com", "name": "Test User 1"},
        {"email": "test@example.com", "name": "Test User 2"},
    ]
    mock_dao.find.return_value = test_users

    # Act
    user_controller.get_user_by_email("test@example.com")
    captured = capsys.readouterr()

    # Assert
    assert "Error: more than one user found with mail test@example.com" in captured.out

def test_no_user_raises_value_error(user_controller, mock_dao):
    # Arrange
    mock_dao.find.return_value = []

    # Act & Assert
    with pytest.raises(ValueError, match="User not found"):
        user_controller.get_user_by_email("nonexistent@example.com")

def test_invalid_email_raises_value_error(user_controller):
    # Act & Assert
    with pytest.raises(ValueError, match="Error: invalid email address"):
        user_controller.get_user_by_email("invalid-email")

def test_database_error_raises_exception(user_controller, mock_dao):
    # Arrange
    mock_dao.find.side_effect = Exception("Database error")

    # Act & Assert
    with pytest.raises(Exception):
        user_controller.get_user_by_email("test@example.com")
