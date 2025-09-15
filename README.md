
# Deploy HTML app
notion : https://www.notion.so/Deploy-app-26b43a38c84a807d8020fdd49600c0af?source=copy_link
## Path และไฟล์ที่ต้องมี

```
project
|__ index.html
|__ Dockerfile
|__ docker-compose.yml
|__ manifest
    |__ app-deployment.yaml
    |__ app-service.yaml
    |__ app-ingress.yaml
```

## เครื่องมือที่ต้องติดตั้งใน VM เเละสิ่งที่ต้องเตรียมไว้
1. ติดตั้ง docker

    https://docs.docker.com/engine/install/ubuntu/

2. ติดตั้ง docker compose

    ```bash
    apt install docker-compose
    ```

3. ติดตั้ง K0S

    ```bash
    curl -sSLf https://get.k0s.sh/ | sudo sh
    ```

4. ติดตั้ง Kubebernetes cluster
    
    4.1 สร้าง k0s.yaml

    ```bash
    cd /etc && mkdir -p k0s && cd k0s && vi k0s.yaml
    ```

    4.2 ใส่ Config
    
    ``` yaml
    apiVersion: k0s.k0sproject.io/v1beta1
    kind: ClusterConfig
    metadata:
      name: k0s
    spec:
      api:
        address: <internal ip>
        port: 6443
        sans:
          - <external ip>
     ```
    4.3 สร้าง Single node ของ k0s (controller + worker)
    
    ```bash
    sudo k0s install controller -c /etc/k0s/k0s.yaml --single
    ```
    4.4 เปิด k0s และเช็คสถานะ
    ```bash
    k0s start
    k0s status
    ```
5. ติดตั้ง NGINX Ingress Controller
    ```bash
    k0s kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
    ```
    5.1 เช็คชื่อ ingress class เพื่อนำไปใส่ในไฟล์ manifest
    ```bash
    k0s kubectl get ingressclass
    ```
6. สร้าง container registry เเละ sub-user ใน nipa space

## How to build docker image
 สร้าง Docker images จาก Dockerfile และ docker-compose.yml เก็บใน container registry 
1. `cd project`

2. ใช้คำสั่งอ่านไฟล์ docker-compose.yml เพื่อสร้าง container และ build image จาก Dockerfile

    ```bash
    docker-compose up -d --build
    ```
3. Login container registry ของ nipa
    ```bash 
    docker login registry.nipa.cloud
    ```
    เอา User Password มาจาก Sub-user ใน nipa

    ```bash
    user: luntest
    password: Lun123456!
    ```
4. ใช้คำสั่ง Tag images
    ```bash
    # รูปแบบคำสั่ง
    docker tag SOURCE_IMAGE[:TAG] registry.nipa.cloud/lun-test/IMAGE[:TAG]
    ```
    Tag Docker image ไปยัง container registry เพื่อให้ Tag Docker image มีชื่อที่ตรงกับชื่อ repository ใน nipa

    ```bash
    docker tag hello-world-app registry.nipa.cloud/lun-test/hello-world-app:latest
    ```

5. ใช้คำสั่ง Push images
    ```bash
    # รูปแบบคำสั่ง
    docker push registry.nipa.cloud/lun-test/IMAGE[:TAG]
    ```
    Push Docker image ไปยัง container registry จากนั้น image จะไปขึ้นใน container registry ของ nipa

    ```bash
    docker push registry.nipa.cloud/lun-test/hello-world-app:latest
    ```

## Deploy docker image to kubernetes
สร้าง manifest file ชื่อ app-deployment.yaml , app-service.yaml และ app-ingress.yaml สำหรับ Kubernetes
- ใช้คำสั่ง kubectl apply เพื่อ deploy แอปลง Kubernetes (Pods)
    ```bash
    k0s kubectl apply -f app-deployment.yaml
    k0s kubectl apply -f app-service.yaml
    k0s kubectl apply -f app-ingress.yaml
    ```
- เช็ค type ของ ingress-nginx-controller
    ```bash 
    k0s kubectl get svc -A
    ```
- เเก้ไข type ของ ingress-nginx-controller เป็น “NodePort” 
    ```bash
    k0s kubectl edit svc ingress-nginx-controller -n ingress-nginx
    ```
    เก็บ Port ของ ingress-nginx-controller ไว้ใช้ 
    `<external ip>:port` เป็น locathost ของ web
- เปิด terminal ที่เครื่อง local ของตัวเอง

    พิมพ์ `sudo vi /etc/hosts`
    
    เพิ่ม `<external ip>   <hosts ที่ตั้งใน ingress.yaml>`
## วิธีเปิดเว็บใช้งาน
- Host : `hello-world-app.lun.com`
- localhost : `<external ip>:port ของ ingress หรือ port ของ svc`