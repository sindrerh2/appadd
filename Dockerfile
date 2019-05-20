FROM circleci/node:11.10.0

ADD . .

#RUN npm ci
#COPY . .

#ENV proxy=http://webproxy-internett.nav.no:8088

#ENV https-proxy=http://webproxy-internett.nav.no:8088

RUN env

#RUN npm set prefix=/home/circleci/npm && echo 'export PATH=$HOME/circleci/npm/bin:$PATH' >> /home/circleci/.bashrc

RUN sudo npm install --loglevel=warn password-generator
RUN sudo npm install --loglevel=warn request
RUN sudo npm install --loglevel=warn dotenv
RUN sudo npm install --loglevel=warn js-yaml
RUN sudo npm install --loglevel=warn fs
RUN ls -la src

ENTRYPOINT ["src/addapp.js"]