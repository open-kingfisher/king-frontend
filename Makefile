PROJECT=kingfisher
SERVICE=king-frontend
REGISTRY=registry.kingfisher.com.cn
REVISION=latest

build:
	npm run build_pro
push_pro:
	docker build -f Dockerfile -t $(REGISTRY)/$(PROJECT)/$(SERVICE_PRO):$(REVISION) .
	docker push $(REGISTRY)/$(PROJECT)/$(SERVICE_PRO):$(REVISION)
