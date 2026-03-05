#!/bin/sh
# ----------------------------------------------------------------------------
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# Apache Maven Wrapper startup script
# ----------------------------------------------------------------------------

# If JAVA_HOME is not set, try to detect java from PATH
if [ -n "$JAVA_HOME" ]; then
  JAVACMD="$JAVA_HOME/bin/java"
  if [ ! -f "$JAVACMD" ]; then
    echo "Error: JAVA_HOME is set to an invalid directory: $JAVA_HOME" >&2
    echo "Please set JAVA_HOME to the location of your JDK." >&2
    exit 1
  fi
else
  JAVACMD="java"
  if ! command -v java > /dev/null 2>&1; then
    echo "Error: JAVA_HOME is not set and 'java' is not on the PATH." >&2
    echo "Please set JAVA_HOME or add java to your PATH." >&2
    exit 1
  fi
fi

# Find the project base dir (directory containing pom.xml)
MAVEN_PROJECTBASEDIR="$OLDPWD"
if [ "$MAVEN_PROJECTBASEDIR" = "" ]; then
  MAVEN_PROJECTBASEDIR="$PWD"
fi

# Walk up to find the multi-module root
wdir="$PWD"
while [ "$wdir" != "/" ]; do
  if [ -f "$wdir/pom.xml" ]; then
    MAVEN_PROJECTBASEDIR="$wdir"
  fi
  wdir=$(dirname "$wdir")
done
export MAVEN_PROJECTBASEDIR

WRAPPER_JAR="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.jar"
WRAPPER_PROPERTIES="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.properties"
WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

# Read wrapperUrl from properties
WRAPPER_URL=""
if [ -r "$WRAPPER_PROPERTIES" ]; then
  WRAPPER_URL=$(grep -E '^wrapperUrl=' "$WRAPPER_PROPERTIES" | cut -d'=' -f2-)
fi
if [ -z "$WRAPPER_URL" ]; then
  WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
fi

# Download the wrapper jar if absent
if [ ! -e "$WRAPPER_JAR" ]; then
  echo "Downloading Maven Wrapper..."
  if command -v wget > /dev/null 2>&1; then
    wget -q -O "$WRAPPER_JAR" "$WRAPPER_URL" || { echo "Could not download maven-wrapper.jar" >&2; exit 1; }
  elif command -v curl > /dev/null 2>&1; then
    curl -fsSL -o "$WRAPPER_JAR" "$WRAPPER_URL" || { echo "Could not download maven-wrapper.jar" >&2; exit 1; }
  else
    echo "Error: wget or curl is required to download maven-wrapper.jar." >&2
    exit 1
  fi
fi

exec "$JAVACMD" \
  ${MAVEN_OPTS} \
  -classpath "$WRAPPER_JAR" \
  "-Dmaven.multiModuleProjectDirectory=$MAVEN_PROJECTBASEDIR" \
  ${MAVEN_DEBUG_OPTS} \
  ${JVMARGS} \
  $WRAPPER_LAUNCHER "$@"
