import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from dotenv import load_dotenv

# Add the src directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

from database.models import Base, User
from config import DATABASE_URL

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def setup_database():
    print("Starting database setup...")
    print(f"Database URL: {DATABASE_URL}")
    
    # Connect to the default 'postgres' database to create 'regulatory_intelligence'
    default_db_url = DATABASE_URL.rsplit('/', 1)[0] + '/postgres'
    print(f"Connecting to default database: {default_db_url}")
    
    try:
        engine_default = create_engine(default_db_url)
        with engine_default.connect() as connection:
            connection.execute(text("COMMIT"))  # End any transaction
            try:
                connection.execute(text("CREATE DATABASE regulatory_intelligence"))
                print("Database 'regulatory_intelligence' created successfully.")
            except Exception as e:
                if "already exists" in str(e):
                    print("Database 'regulatory_intelligence' already exists.")
                else:
                    print(f"Error creating database: {e}")
        engine_default.dispose()
    except Exception as e:
        print(f"Could not connect to default database. Please ensure PostgreSQL is running and credentials are correct.")
        print(f"Error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure PostgreSQL is installed and running")
        print("2. Check if the 'postgres' user exists and has the correct password")
        print("3. Verify the DATABASE_URL in your .env file")
        sys.exit(1)

    print("\nCreating tables in 'regulatory_intelligence' database...")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    try:
        # Create all tables defined in Base
        Base.metadata.create_all(bind=engine)
        print("All database tables created successfully.")

        db = SessionLocal()
        try:
            # Create default admin user if not exists
            admin_username = "admin"
            admin_email = "admin@example.com"
            admin_password = "admin123"  # This will be hashed

            existing_admin = db.query(User).filter(User.username == admin_username).first()
            if not existing_admin:
                hashed_password = get_password_hash(admin_password)
                admin_user = User(
                    email=admin_email,
                    username=admin_username,
                    hashed_password=hashed_password,
                    full_name="Administrator",
                    is_active=True,
                    is_superuser=True
                )
                db.add(admin_user)
                db.commit()
                db.refresh(admin_user)
                print(f"Default admin user '{admin_username}' created successfully.")
                print(f"   Username: {admin_username}")
                print(f"   Password: {admin_password}")
                print(f"   Email: {admin_email}")
            else:
                print(f"Admin user '{admin_username}' already exists.")
        finally:
            db.close()
        
        print("\nDatabase setup completed successfully!")
        print("\nNext steps:")
        print("1. Start your backend server: python -m uvicorn main:app --reload")
        print("2. Start your frontend: npm start")
        print("3. Login with admin credentials to test the system")

    except Exception as e:
        print(f"An error occurred during table creation or user insertion: {e}")
        sys.exit(1)
    finally:
        engine.dispose()

if __name__ == "__main__":
    setup_database()