#!/bin/sh
set -eu
mkdir -p /home/dshprobe/.ssh
chmod 700 /home/dshprobe/.ssh
if [ -f /tmp/lab_authorized_keys ]; then
  cp /tmp/lab_authorized_keys /home/dshprobe/.ssh/authorized_keys
fi
chown -R dshprobe:dshprobe /home/dshprobe/.ssh
chmod 600 /home/dshprobe/.ssh/authorized_keys 2>/dev/null || true
exec /usr/sbin/sshd -D -e
