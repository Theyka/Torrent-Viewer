document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("torrentFile");
    const selectButton = document.getElementById("selectTorrent");

    selectButton.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const buffer = new Uint8Array(event.target.result);
                const blob = new Blob([buffer]);
                await loadTorrent(blob);
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Error loading torrent:", error);
        }
    });
});

async function loadTorrent(torrentId) {
    const client = new WebTorrent();
    client.add(torrentId, (torrent) => {
        document.getElementById("torrentName").innerText = torrent.name || "Unknown";
        document.getElementById("torrentSize").innerText = formatBytes(torrent.length);
        document.getElementById("infoHash").innerText = torrent.infoHash;
        document.getElementById("privateFlag").innerText = torrent.private ? "Yes" : "No";
        document.getElementById("piecesInfo").innerText =  `${torrent.pieces.length} (${formatBytes(torrent.pieceLength)})`;
        document.getElementById("createdBy").innerText = torrent.createdBy || "Unknown";
        document.getElementById("createdOn").innerText = torrent.created || "Unknown";
        document.getElementById("filesCount").innerText = torrent.files.length;

        const fileList = document.getElementById("fileList");
        fileList.innerHTML = "";
        torrent.files.forEach(file => {
            const li = document.createElement("li");
            li.textContent = `${file.name} (${formatBytes(file.length)})`;
            fileList.appendChild(li);
        });

        const trackerList = document.getElementById('trackerList');
        trackerList.innerHTML = "";
        document.getElementById('trackerCount').innerText = torrent.announce.length;

        // Group trackers by type
        const httpsTrackers = [];
        const httpTrackers = [];
        const tcpTrackers = [];
        const udpTrackers = [];

        torrent.announce.forEach(tracker => {
            if (tracker.startsWith('https://')) {
                httpsTrackers.push(tracker);
            } else if (tracker.startsWith('http://')) {
                httpTrackers.push(tracker);
            } else if (tracker.startsWith('udp://')) {
                udpTrackers.push(tracker);
            }
        });

        const orderedTrackers = [...httpsTrackers, ...httpTrackers, ...tcpTrackers, ...udpTrackers];

        orderedTrackers.forEach(tracker => {
            const li = document.createElement('li');
            li.innerText = tracker;
            trackerList.appendChild(li);
        });
        document.getElementById('stats').classList.add('visible');
    });
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}
