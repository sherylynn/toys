#!/bin/bash
words='nice to meet u!'
cat <<EOF
hello $words
EOF

cat <<-'EOF'
hello $words
EOF
