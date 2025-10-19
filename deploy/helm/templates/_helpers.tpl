{{- define "lspp-server.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "lspp-server.fullname" -}}
{{- printf "%s-%s" (include "lspp-server.name" .) .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
