import requests
from fastapi import HTTPException

def fetch_file_content(repo_full_name: str, file_path: str) -> str:
    owner, repo = repo_full_name.split("/")
    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/{file_path}"
    try:
        response = requests.get(raw_url)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching file content: {e}")

def get_repo_context(repo_full_name: str) -> str:
    context_parts = []

    # Fetch README.md
    readme_content = fetch_file_content(repo_full_name, "README.md")
    if readme_content and not readme_content.startswith("Could not fetch"):
        context_parts.append(f"README.md:\n```\n{readme_content}\n```\n")

    # Fetch LICENSE
    license_content = fetch_file_content(repo_full_name, "LICENSE")
    if license_content and not license_content.startswith("Could not fetch"):
        context_parts.append(f"LICENSE:\n```\n{license_content}\n```\n")

    # Fetch CONTRIBUTING.md
    contributing_content = fetch_file_content(repo_full_name, "CONTRIBUTING.md")
    if contributing_content and not contributing_content.startswith("Could not fetch"):
        context_parts.append(f"CONTRIBUTING.md:\n```\n{contributing_content}\n```\n")

    # Fetch other potential key files (add more as needed)
    other_files = ["CODE_OF_CONDUCT.md", "ARCHITECTURE.md", "SUMMARY.md"]
    for file in other_files:
        content = fetch_file_content(repo_full_name, file)
        if content and not content.startswith("Could not fetch"):
            context_parts.append(f"{file}:\n```\n{content}\n```\n")

    return "\n\n".join(context_parts)