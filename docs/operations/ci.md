# Continuous Integration

[Home](../Home.md)

Code in branch develop/staging is automatically build and deployed via a manual trigger.

![CI jobs overview showing jobs](ci_jobs_diagram)

## Steps

1. Trigger   - [CI build  http://cit.cessda.eu]( http://cit.cessda.eu)
1. Runs      - static code analysis
1. Dumps     - stats to [Sonar Qube](http://sonar.cessda.eu:9000/projects)
1. Installs  -  app to Environment (Dev/Staging)

## Apps Jobs

1. [XXXXX]()
1. [YYYYY]()
1. [Searchkit-UI]()

## Auxilary Jobs

1. [CESSDA_pasc.staging.backup]()  of Elasticsearch Indices.
1. [CESSDA_pasc.development.backup]() of Elasticsearch Indices.
1. [CESSDA_deploy.mail.relay]().
1. [CESSDA_cessda.monitoring]().  Keeps an eye on the .m2 folder shared by the java applications ci build agents for maven dependences.

![ci_jobs_diagram](../images/ci_jobs.png) "ci jobs image"