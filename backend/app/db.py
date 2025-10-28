from sqlmodel import SQLModel, create_engine

# Dev branch has db in backend folder
# Prod: sqlite:////var/data/bloom.db (For persistence in hosting solution)
DATABASE_URL = "sqlite:///bloom.db"

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)