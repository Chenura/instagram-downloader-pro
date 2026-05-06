function getAllMedia() {
    let media = [];

    // IMAGES
    document.querySelectorAll("img").forEach(img => {
        if (img.src && img.src.includes("cdninstagram")) {
            media.push({ type: "image", url: img.src });
        }
    });

    // VIDEOS
    document.querySelectorAll("video").forEach(video => {
        if (video.src && !video.src.startsWith("blob:")) {
            media.push({ type: "video", url: video.src });
        } else {
            const source = video.querySelector("source");
            if (source && source.src) {
                media.push({ type: "video", url: source.src });
            }
        }
    });

    // NETWORK FALLBACK (for reels/stories)
    const resources = performance.getEntriesByType("resource");
    resources.forEach(r => {
        if (r.name.includes(".mp4")) {
            media.push({ type: "video", url: r.name });
        }
    });

    // REMOVE DUPLICATES
    const unique = [];
    const urls = new Set();

    media.forEach(item => {
        if (!urls.has(item.url)) {
            urls.add(item.url);
            unique.push(item);
        }
    });

    return unique;
}

function downloadAll(mediaList) {
    mediaList.forEach((item, index) => {
        setTimeout(() => {
            browser.runtime.sendMessage({
                type: "DOWNLOAD",
                url: item.url,
                filename: `${item.type}_${Date.now()}_${index}.${item.type === "video" ? "mp4" : "jpg"}`
            });
        }, index * 800);
    });
}

function injectButton(mediaList) {
    if (document.querySelector(".ig-download-all")) return;

    const btn = document.createElement("button");
    btn.innerText = "⬇ Download All";
    btn.className = "ig-download-all";

    btn.onclick = () => {
        if (mediaList.length === 0) {
            alert("No media found");
            return;
        }
        downloadAll(mediaList);
    };

    document.body.appendChild(btn);
}

function run() {
    const media = getAllMedia();
    if (media.length > 0) {
        injectButton(media);
    }
}

// OBSERVER (important)
const observer = new MutationObserver(run);
observer.observe(document.body, {
    childList: true,
    subtree: true
});
