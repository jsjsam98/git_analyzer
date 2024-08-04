import subprocess
import os
import re
import json
from collections import defaultdict
import uuid
import argparse


# Function to get the list of all authors
def get_all_authors(repo_path):
    result = subprocess.run(
        ["git", "-C", repo_path, "log", "--format=%an"],
        stdout=subprocess.PIPE,
        text=True,
    )
    authors = set(result.stdout.strip().split("\n"))
    return list(authors)


# Function to get the git commits for a specific author
def get_git_commits(repo_path, author):
    unique_delimiter = str(uuid.uuid4())
    result = subprocess.run(
        [
            "git",
            "-C",
            repo_path,
            "log",
            "--author={}".format(author),
            "--pretty=format:{}%H %ad %s".format(unique_delimiter),
            "--date=short",
            "--numstat",
        ],
        stdout=subprocess.PIPE,
        text=True,
    )
    commits = []
    commit_blocks = result.stdout.split(unique_delimiter)[
        1:
    ]  # Split by the unique delimiter and skip the first empty split

    for block in commit_blocks:
        lines = block.strip().split("\n")
        if lines:
            parts = lines[0].split(maxsplit=2)
            current_commit = {
                "hash": parts[0],
                "date": parts[1],
                "message": parts[2] if len(parts) > 2 else "",
                "files": [],
            }
            for line in lines[1:]:
                match = re.match(r"^(\d+)\t(\d+)\t.*\.(\w+)$", line)
                if match:
                    added = match.group(1)
                    removed = match.group(2)
                    file_path = match.group(3)
                    current_commit["files"].append(
                        {
                            "file": file_path,
                            "added": int(added),
                            "removed": int(removed),
                        }
                    )
            commits.append(current_commit)

    return commits


def generate_contributions_json(repo_path, output_path):
    # Get all authors
    authors = get_all_authors(repo_path)

    # Initialize results list
    results = []

    # Loop through each author and calculate contributions
    for author in authors:
        commits = get_git_commits(repo_path, author)

        # Aggregate contributions by file extension
        contributions = defaultdict(lambda: {"added": 0, "removed": 0})

        for commit in commits:
            for file in commit["files"]:
                file_extension = file["file"].split(".")[-1]
                contributions[file_extension]["added"] += file["added"]
                contributions[file_extension]["removed"] += file["removed"]

        # Add contributions and commits to the results
        results.append(
            {"author": author, "contributions": dict(contributions), "commits": commits}
        )

    # Write the results to the JSON file
    with open(output_path, "w") as file:
        json.dump(results, file, indent=4)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Git contributions JSON.")
    parser.add_argument(
        "repo_path",
        nargs="?",
        default=os.getcwd(),
        help="Path to the Git repository (default: current directory)",
    )
    args = parser.parse_args()
    repo_path = args.repo_path
    current_directory = os.getcwd()
    output_path = os.path.join(current_directory, "contributions.json")

    # Generate the contributions JSON
    generate_contributions_json(repo_path, output_path)
