@echo off
setlocal
set "M2_MAVEN=C:\Users\Akuthota\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd"
if exist "%M2_MAVEN%" (
    call "%M2_MAVEN%" %*
) else (
    call mvn %*
)
endlocal
