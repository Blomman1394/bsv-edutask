import pytest
from unittest.mock import Mock
from src.controllers.usercontroller import UserController

# backend/src/controllers/test_usercontroller.py


@pytest.fixture
def mock_dao():
    # Create mock DAO object
    dao = Mock()
    return dao


@pytest.fixture
def user_controller(mock_dao):
    # Create UserController instance with mock DAO
    return UserController(dao=mock_dao)


def test_get_user_by_email_single_user(user_controller, mock_dao):
    # Arrange
    test_user = {"email": "test@example.com", "name": "Test User"}
    mock_dao.find.return_value = [test_user]

    # Act
    result = user_controller.get_user_by_email("test@example.com")

    # Assert
    assert result == test_user
    mock_dao.find.assert_called_once_with({"email": "test@example.com"})


def test_get_user_by_email_multiple_users(user_controller, mock_dao, capsys):
    # Arrange
    test_users = [
        {"email": "test@example.com", "name": "Test User 1"},
        {"email": "test@example.com", "name": "Test User 2"},
    ]
    mock_dao.find.return_value = test_users

    # Act
    result = user_controller.get_user_by_email("test@example.com")
    captured = capsys.readouterr()

    # Assert
    assert result == test_users[0]
    assert "Error: more than one user found with mail test@example.com" in captured.out
    mock_dao.find.assert_called_once_with({"email": "test@example.com"})


def test_get_user_by_email_no_user(user_controller, mock_dao):
    # Arrange
    mock_dao.find.return_value = []

    # Act
    with pytest.raises(IndexError):
        user_controller.get_user_by_email("nonexistent@example.com")

    # Assert
    mock_dao.find.assert_called_once_with({"email": "nonexistent@example.com"})


def test_get_user_by_email_invalid_format(user_controller):
    # Act & Assert
    with pytest.raises(ValueError, match="Error: invalid email address"):
        user_controller.get_user_by_email("invalid-email")


def test_get_user_by_email_db_error(user_controller, mock_dao):
    # Arrange
    mock_dao.find.side_effect = Exception("Database error")

    # Act & Assert
    with pytest.raises(Exception):
        user_controller.get_user_by_email("test@example.com")
