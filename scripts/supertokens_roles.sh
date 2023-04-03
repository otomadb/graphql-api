#!/usr/bin/env bash

http -v PUT "$SUPERTOKENS_CONNECTION_URI/recipe/role" api-key:$SUPERTOKENS_API_KEY role=user   permissions:='["create:mylist","edit:mylist","update:mylist_registration","create:registration_request"]'
http -v PUT "$SUPERTOKENS_CONNECTION_URI/recipe/role" api-key:$SUPERTOKENS_API_KEY role=editor permissions:='["create:tag","edit:tag","create:tagging","remove:tagging","create:semitag","create:video","check:registration_request"]'
http -v PUT "$SUPERTOKENS_CONNECTION_URI/recipe/role" api-key:$SUPERTOKENS_API_KEY role=admin  permissions:='["create:tag_type","create:category_tag"]'

roles=$(http GET "$SUPERTOKENS_CONNECTION_URI/recipe/roles" api-key:$SUPERTOKENS_API_KEY | jq -r ".roles[]")
for role in $roles; do
  http -v GET "$SUPERTOKENS_CONNECTION_URI/recipe/role/permissions?role=$role" api-key:$SUPERTOKENS_API_KEY
done
