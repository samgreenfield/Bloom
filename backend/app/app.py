from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from .schema import schema

# Frontend hosting address
# Prod: https://bloomlms.netlify.app (hosting in netlify)
origins = ["http://localhost:5173"]

app = FastAPI(title="Bloom API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In production,  (no UI in /graphql)
# graphql_app = GraphQLRouter(schema, graphiql=False)
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
def root():
    return # {"message": "Bloom backend is running!"}