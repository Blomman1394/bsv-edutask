import os
import pytest
from src.util.dao import DAO
from pymongo.errors import WriteError, ConnectionFailure


@pytest.fixture
def test_collection(tmp_path):
    """Fixture that provides a test collection and cleans up after tests"""
    try:
        # Create temporary validator file
        validator_dir = tmp_path / "validators"
        validator_dir.mkdir()
        validator_file = validator_dir / "test_collection.json"
        validator_file.write_text(
            """{
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["name", "email"],
                "properties": {
                    "name": { "bsonType": "string" },
                    "email": { "bsonType": "string" },
                    "active": { "bsonType": "bool" }
                }
            }
        }"""
        )

        os.environ["VALIDATORS_PATH"] = str(validator_dir)
        os.environ["MONGO_URL"] = (
            "mongodb://root:root@localhost:27017/rootDb?authSource=admin"
        )

        dao = DAO("test_collection")

        # Create unique index for email
        dao.collection.create_index("email", unique=True)

        yield dao
        dao.collection.drop()
    except Exception as e:
        pytest.skip(f"MongoDB setup failed: {str(e)}")


def test_create_valid_document(test_collection):
    """Test creating a document with valid data"""
    test_data = {"name": "Test User", "email": "test@example.com", "active": True}

    result = test_collection.create(test_data)

    assert result is not None
    assert result["name"] == test_data["name"]
    assert result["email"] == test_data["email"]
    assert "_id" in result


def test_create_missing_required_field(test_collection):
    """Test creating a document with missing required field"""
    test_data = {
        "email": "test@example.com",  # Missing required 'name' field
        "active": True,
    }

    with pytest.raises(WriteError):
        test_collection.create(test_data)


def test_create_invalid_data_type(test_collection):
    """Test creating a document with wrong data type"""
    test_data = {
        "name": "Test User",
        "email": "test@example.com",
        "active": "not_a_boolean",  # Should be boolean
    }

    with pytest.raises(WriteError):
        test_collection.create(test_data)


def test_create_duplicate_unique_field(test_collection):
    """Test creating documents with duplicate unique fields"""
    test_data_1 = {"name": "Test User 1", "email": "same@example.com", "active": True}
    test_data_2 = {
        "name": "Test User 2",
        "email": "same@example.com",  # Duplicate email
        "active": True,
    }

    test_collection.create(test_data_1)
    with pytest.raises(WriteError):
        test_collection.create(test_data_2)
