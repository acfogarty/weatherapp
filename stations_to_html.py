# write html of formqt
#    <option value="KASSEL">Kassel</option>
# for insertion into index.html

ff = open('station-mapping.csv', 'r')
for line in ff:
    ll = line.split(';')
    print '<option value="' + ll[0].strip() + '">' + ll[1].strip() + '</option>' 
ff.close()
