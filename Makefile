VERSION := patch

release:
	set -e
	echo "Releasing version: $(VERSION)"
	git checkout master
	git pull origin master
	npm run lint
	npm test
	npm run clean
	npm run transpile
	npm run dist
	git add dist/
	git diff --quiet --exit-code --cached || git commit -m 'dist'
	npm version $(VERSION)
	npm publish
	git push --follow-tags
