# copy src from locahost to server
scp -r D:/nest/windows-taps-server/src root@188.68.221.24:/var/www/diarma.ru

# restart server
sudo systemctl restart diarma.service
