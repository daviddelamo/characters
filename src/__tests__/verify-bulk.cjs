const fs = require('fs');
const path = require('path');

async function testBulkUpload() {
    const jsonPath = path.resolve(__dirname, '../../data/characters.example.json');
    const fileContent = fs.readFileSync(jsonPath);

    const formData = new FormData();
    const blob = new Blob([fileContent], { type: 'application/json' });
    formData.append('file', blob, 'characters.example.json');

    console.log("Sending bulk upload request...");
    try {
        const res = await fetch('http://localhost:3000/api/characters/bulk', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            console.log("Upload successful!");
            console.log("Results summary:");
            const successCount = data.results.filter(r => r.status === 'success').length;
            const errorCount = data.results.filter(r => r.status === 'error').length;
            console.log(`- Successes: ${successCount}`);
            console.log(`- Errors: ${errorCount}`);

            if (errorCount > 0) {
                console.log("\nErrors details:");
                data.results.filter(r => r.status === 'error').forEach(r => {
                    console.log(`  - ${r.name}: ${r.error}`);
                });
            }
        } else {
            const errorText = await res.text();
            console.error(`Upload failed with status ${res.status}: ${errorText}`);
        }
    } catch (err) {
        console.error("Network error:", err);
    }
}

testBulkUpload();
