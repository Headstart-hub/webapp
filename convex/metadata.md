Users
 ├─ userEducations ──► institutions
 ├─ userLanguages ◄──► languages
 ├─ userSkills ◄────► skills ──► skillCategories
 ├─ profileChangeLogs
 ├─ userLoginEvents
 ├─ userReports (about users)
 └─ projectMembers ◄── projects
                       ├─ projectStatuses
                       ├─ projectChangeLogs
                       ├─ projectSkills ◄── skills
                       ├─ projectCandidates ──► projectRecruitmentStatuses
                       ├─ projectMemberStatuses / memberStatusReasons / projectMemberStatusChanges
                       ├─ projectRoleDefinitions
                       ├─ chats ─► chatParticipants ─► chatMessages ─► chatMessageReadReceipts
                       └─ (optional) event linkage via invitations

Organizations
 └─ events
     └─ invitations (org + event + project bridge)

Reports (product bugs)
 ├─ errorReports
 │   ├─ errorReportSeverities / Priorities / Statuses / Categories
 │   ├─ errorReportAttachments
 │   ├─ errorReportPlatforms
 │   └─ errorReportStatusChanges
 └─ userReports (moderation)
     ├─ userReportReasons / Severities / Statuses
     ├─ userReportAttachments
     └─ userReportStatusChanges
      
      