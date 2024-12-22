console.log("Content script loaded on GitHub!");

function getRepoInfo() {
  const pathSegments = window.location.pathname.split("/");
  if (pathSegments.length >= 3) {
    const owner = pathSegments[1];
    const repo = pathSegments[2];
    return { owner, repo };
  }
  return null;
}

async function fetchRepoDetails(owner, repo) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching repo details:", error);
    return null;
  }
}

async function fetchRepoFileStructure(owner, repo, branch = "main") {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.tree; // The 'tree' property contains the file structure
  } catch (error) {
    console.error("Error fetching repo file structure:", error);
    return null;
  }
}

(async () => {
  const repoInfo = getRepoInfo();
  if (repoInfo) {
    console.log("Repository Info:", repoInfo);
    const repoDetails = await fetchRepoDetails(repoInfo.owner, repoInfo.repo);
    if (repoDetails) {
      console.log("Repository Details:", repoDetails);

      // Send the repository details to the popup
      chrome.runtime.sendMessage({
        action: "repoDetails",
        payload: repoDetails,
      });

      // Fetch and send the file structure
      const fileStructure = await fetchRepoFileStructure(
        repoInfo.owner,
        repoInfo.repo,
        repoDetails.default_branch
      );
      if (fileStructure) {
        console.log("Repository File Structure:", fileStructure);
        chrome.runtime.sendMessage({
          action: "repoFileStructure",
          payload: fileStructure,
        });
      }
    }
  }
})();
