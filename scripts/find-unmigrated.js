const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('route.ts') || file.endsWith('page.tsx') || file.endsWith('layout.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(process.cwd(), 'src', 'app'));

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('params:') && !content.includes('Promise<') && !content.includes('"use client"') && !content.includes("'use client'")) {
        // Check if it's likely a dynamic route parameter
        if (content.match(/params:\s*\{/)) {
            console.log('UNMIGRATED:', file);
        }
    }
});
