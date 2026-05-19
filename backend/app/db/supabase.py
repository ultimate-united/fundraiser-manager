import os
from supabase import create_client, Client

# TODO: call get_client() wherever you need Supabase access
def get_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, key)
