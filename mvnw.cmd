@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "MAVEN_PROJECTBASEDIR=%~dp0")
@SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain
@SET WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar

@IF NOT EXIST %WRAPPER_JAR% (
  @ECHO Downloading Maven Wrapper...
  @powershell -Command "&{"^
    "$webclient = new-object System.Net.WebClient;"^
    "$webclient.DownloadFile('%WRAPPER_URL%', %WRAPPER_JAR%)"^
    "}"
  @IF ERRORLEVEL 1 GOTO error
)

@SET JAVA_EXE=%JAVA_HOME%\bin\java.exe
@IF NOT EXIST "%JAVA_EXE%" (
  @SET JAVA_EXE=java.exe
)

@"%JAVA_EXE%" %MAVEN_OPTS% ^
  -classpath %WRAPPER_JAR% ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  %JVMARGS% ^
  %WRAPPER_LAUNCHER% %*
@IF ERRORLEVEL 1 GOTO error
@GOTO end

:error
@SET ERROR_CODE=1

:end
@CMD /C EXIT /B %ERROR_CODE%
