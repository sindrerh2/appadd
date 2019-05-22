FROM circleci/node:11.10.0

ADD . .

#RUN sudo npm install --loglevel=warn password-generator
RUN sudo npm install --loglevel=warn request
RUN sudo npm install --loglevel=warn dotenv
RUN sudo npm install --loglevel=warn js-yaml
RUN sudo npm install --loglevel=warn fs