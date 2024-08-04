let contributionsData;
let chart;
const authorSelect = document.getElementById("author-select");
const fileTypeCheckboxes = document.getElementById("file-type-checkboxes");

async function loadContributions() {
	const response = await fetch("contributions.json");
	contributionsData = await response.json();
	// sort contributionData by author name
	contributionsData.sort((a, b) => a.author.localeCompare(b.author));
	populateUI();
	displayAllUsersContributions();
}

function populateUI() {
	// Populate author select
	for (const authorData of contributionsData) {
		const option = document.createElement("option");
		option.value = authorData.author;
		option.textContent = authorData.author;
		authorSelect.appendChild(option);
	}

	authorSelect.addEventListener("change", function () {
		const selectedAuthor = this.value;
		if (selectedAuthor) {
			displayUserContributions(selectedAuthor);
		} else {
			displayAllUsersContributions();
		}
	});

	// Collect all file types
	const allFileTypes = new Set();
	for (const authorData of contributionsData) {
		const contributions = authorData.contributions;
		for (const fileType in contributions) {
			allFileTypes.add(fileType);
		}
	}

	// Populate file type checkboxes
	updateFileTypeCheckboxes(allFileTypes);

	// Add event listeners to file type checkboxes
	fileTypeCheckboxes.addEventListener("change", function () {
		const selectedAuthor = authorSelect.value;
		if (selectedAuthor) {
			displayUserContributions(selectedAuthor);
		} else {
			displayAllUsersContributions();
		}
	});
}

function displayAllUsersContributions() {
	if (chart) {
		chart.destroy();
	}

	const totalContributions = {};
	const selectedFileTypes = getSelectedFileTypes();

	for (const authorData of contributionsData) {
		const contributions = authorData.contributions;
		let authorTotal = 0;
		for (const fileType of selectedFileTypes) {
			if (contributions[fileType]) {
				authorTotal += contributions[fileType].added;
			}
		}
		totalContributions[authorData.author] = authorTotal;
	}

	const authors = Object.keys(totalContributions);
	const contributions = Object.values(totalContributions);

	const ctx = document.getElementById("contributionsChart").getContext("2d");
	chart = new Chart(ctx, {
		type: "pie",
		data: {
			labels: authors,
			datasets: [
				{
					label: "Contributions",
					data: contributions,
					backgroundColor: authors.map(
						(_, index) => `hsl(${index * 30}, 70%, 70%)`
					),
				},
			],
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: "top",
				},
			},
		},
	});

	// Clear the commit list
	document.getElementById("commit-list").innerHTML = "";
}

function displayUserContributions(author) {
	if (chart) {
		chart.destroy();
	}

	const authorData = contributionsData.find((data) => data.author === author);
	if (!authorData) return;

	const contributions = authorData.contributions;
	const commits = authorData.commits;

	const selectedFileTypes = getSelectedFileTypes();

	const fileTypes = [];
	const addedLines = [];
	const removedLines = [];

	for (const [ext, counts] of Object.entries(contributions)) {
		if (selectedFileTypes.length === 0 || selectedFileTypes.includes(ext)) {
			fileTypes.push(ext);
			addedLines.push(counts.added);
			removedLines.push(counts.removed);
		}
	}

	const ctx = document.getElementById("contributionsChart").getContext("2d");
	chart = new Chart(ctx, {
		type: "bar",
		data: {
			labels: fileTypes,
			datasets: [
				{
					label: "Added Lines",
					backgroundColor: "rgba(75, 192, 192, 0.2)",
					borderColor: "rgba(75, 192, 192, 1)",
					borderWidth: 1,
					data: addedLines,
				},
				{
					label: "Removed Lines",
					backgroundColor: "rgba(255, 99, 132, 0.2)",
					borderColor: "rgba(255, 99, 132, 1)",
					borderWidth: 1,
					data: removedLines,
				},
			],
		},
		options: {
			responsive: true,
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});

	// Display the recent commits
	const commitList = document.getElementById("commit-list");
	commitList.innerHTML = "<h2>Recent Commits:</h2>";
	commits.forEach((commit) => {
		const commitDiv = document.createElement("div");
		commitDiv.className = "commit";
		commitDiv.innerHTML = `<strong>Commit: ${commit.hash}, Date: ${commit.date}</strong><br>Message: ${commit.message}`;
		commitList.appendChild(commitDiv);
	});
}

function updateFileTypeCheckboxes(fileTypes) {
	fileTypeCheckboxes.innerHTML = "";
	for (const fileType of fileTypes) {
		const label = document.createElement("label");
		label.className = "checkbox-label";
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.value = fileType;
		checkbox.checked = true;
		label.appendChild(checkbox);
		label.appendChild(document.createTextNode(fileType));
		fileTypeCheckboxes.appendChild(label);
	}
}

function getSelectedFileTypes() {
	return Array.from(fileTypeCheckboxes.querySelectorAll("input:checked")).map(
		(checkbox) => checkbox.value
	);
}

// Initialize UI and then load contributions
document.addEventListener("DOMContentLoaded", loadContributions);
