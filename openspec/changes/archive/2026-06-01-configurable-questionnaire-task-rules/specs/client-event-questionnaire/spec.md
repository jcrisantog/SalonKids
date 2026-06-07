## MODIFIED Requirements

### Requirement: Operational task synchronization
The system SHALL convert relevant questionnaire answers into reactive event tasks using active configurable questionnaire task rules while preserving manual overrides made by administrators.

#### Scenario: Pastel answers create tasks
- **WHEN** the client answers that pastel, velitas, batukada, souvenirs or special songs are needed and active rules exist for those answers
- **THEN** the system creates or updates the corresponding operational tasks for staff from configured master tasks

#### Scenario: Pinata answers create tasks
- **WHEN** the client answers that pinata, bolsitas, palo, adult participation or safety opening is needed and active rules exist for those answers
- **THEN** the system creates or updates the corresponding pinata preparation tasks from configured master tasks

#### Scenario: Menu answers create tasks
- **WHEN** the client fills salon menu, external menu, food timing or staff meal permissions and active rules exist for those answers
- **THEN** the system creates or updates kitchen, service or provider coordination tasks from configured master tasks

#### Scenario: Program answers create timeline tasks
- **WHEN** the client provides times for food, presentation, show, candy table, chocolate fountain, dance, tamales, ice cream or another activity and active rules exist for those answers
- **THEN** the system creates or updates scheduled tasks that can appear in the public timeline when marked public

#### Scenario: Informative answer does not create tasks
- **WHEN** the client answers a questionnaire field that has no active configurable rule
- **THEN** the system saves the answer without generating event tasks for that field
