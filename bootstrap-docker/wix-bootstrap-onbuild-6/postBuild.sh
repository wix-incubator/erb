#!/usr/bin/env bash

#Make sure we run "locally"
unset DOCKER_HOST

GROUP_ID=`echo -e 'setns x=http://maven.apache.org/POM/4.0.0\ncat /x:project/x:groupId/text()' | xmllint --shell pom.xml | grep -v / | grep -v "\-\-\-"`
ARTIFACT_ID=`echo -e 'setns x=http://maven.apache.org/POM/4.0.0\ncat /x:project/x:artifactId/text()' | xmllint --shell pom.xml | grep -v / | grep -v "\-\-\-"`

SOURCE_IMAGE="$GROUP_ID.$ARTIFACT_ID"
TARGET_IMAGE="wix-bootstrap-onbuild"
TAGS=("latest" "6")

echo "Source image: $SOURCE_IMAGE"
echo "Target image: $TARGET_IMAGE"

for TAG in ${TAGS[@]}; do
  echo ""
  echo "Tagging as '$TAG'"
  echo docker tag -f "docker-repo.wixpress.com/$SOURCE_IMAGE:snapshot" "docker-repo.wixpress.com/$TARGET_IMAGE:$TAG"
  docker tag -f "docker-repo.wixpress.com/$SOURCE_IMAGE:snapshot" "docker-repo.wixpress.com/$TARGET_IMAGE:$TAG" || exit $?

  echo docker push "docker-repo.wixpress.com/$TARGET_IMAGE:$TAG"
  docker push "docker-repo.wixpress.com/$TARGET_IMAGE:$TAG" || exit $?
done

exit 0