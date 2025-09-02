run app:
	npm run start
	
lint:
	npx eslint .

vite:
	npx vite

build:
	npx vite build

fix:
	npx eslint --fix .

install:
	npm ci

test:
	npx playwright test