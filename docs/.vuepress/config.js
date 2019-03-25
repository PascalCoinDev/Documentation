const fs = require('fs');

module.exports = {
    title: 'PascalCoin Documentation',
    description: 'Just playing around',
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guides', link: '/guide/' },
            { text: 'PIPS', link: '/pips/' },
        ],
        sidebar: {
            '/guide/': getThemeSidebar('Guides', 'Getting started'),
            '/pips/': getPIPsSidebar('PIPs', 'PIPs'),
        },
        displayAllHeaders: false,
        // Assumes GitHub. Can also be a full GitLab url.
        repo: 'PascalCoin/Documentation',
        // Customising the header label
        // Defaults to "GitHub"/"GitLab"/"Bitbucket" depending on `themeConfig.repo`
        repoLabel: 'Contribute!',

        // Optional options for generating "Edit this page" link

        // if your docs are in a different repo from your main project:
        docsRepo: 'PascalCoin/Documentation',
        // if your docs are not at the root of the repo:
        docsDir: 'docs',
        // if your docs are in a specific branch (defaults to 'master'):
        docsBranch: 'master',
        // defaults to false, set to true to enable
        editLinks: true,
        // custom text for edit link. Defaults to "Edit this page"
        editLinkText: 'Help us improve this page!'
    },
    plugins: ['@vuepress/back-to-top']
}

function getThemeSidebar (groupA, introductionA) {
    return [
        {
            title: groupA,
            collapsable: false,
            sidebarDepth: 3,
            children: [
                'getting_started',
                'mining',
                'JSON-RPC-API'
            ]
        },
    ]
}


function getPIPsSidebar (groupA, introductionA) {
    let children = [];
    fs.readdirSync(__dirname + '/../pips').forEach(file => {
        if(file !== 'README.md' && !fs.lstatSync(__dirname + '/../pips/' + file).isDirectory()) {

            let child = [file.replace('.md', ''), file.replace('.md', '')];
            var stop = false;
            var foundPip = false;
            var foundTitle = false;
            var lines = fs.readFileSync(__dirname + '/../pips/' + file, 'utf-8')
                .split('\n')
                .filter((l) => {
                    if(l.trim().substr(0, 4) === 'PIP:' && !foundPip) {
                        child[1] = 'PIP ' + parseInt(l.trim().substr(4).replace('PIP:', '').replace('PIP-', ''), 10);
                        foundPip = true;
                    }
                    if(l.trim().substr(0, 6) === 'Title:' && !foundTitle) {
                        child[1] += ': ' + l.trim().substr(6);
                        foundTitle = true;
                    }
                });

            children.push(child);

        }
    });
    console.log(children);

    return [
        {
            title: 'Pascal Improvement Proposals',
            collapsable: false,
            sidebarDepth: 1,
            children: children
        },
    ]
}
